import { QuestionWithId } from "../question/question.js";

export type PriorityData = {
  wrongAnswerRate: number;
  memorizationRate: number;
  lastAnswerTime: number;
}

export enum AnswerResult {
  Correct = 0,
  Incorrect = 1,
  NotMemorized = 2,
}

let cache: {[groupId: string]: {[id: string]: PriorityData}} = {};

export function cachePriority(groupId: string, id: string, priority: PriorityData) {
  cache[groupId] ??= {};
  cache[groupId][id] = priority;
}

export function resetPriorityCache() {
  cache = {};
}

export function calcPriority(result: AnswerResult): PriorityData {
  return {
    wrongAnswerRate: result == AnswerResult.Incorrect ? 1 : 0,
    memorizationRate: result == AnswerResult.Correct ? 1 : result == AnswerResult.Incorrect ? 0.2 : 0,
    lastAnswerTime: Date.now(),
  }
}

export async function updatePriority(workId: string) {
  for (let groupId in cache) {
    let priorityData = await api.getPriorityData(workId, groupId);
    for (let [id, data] of Object.entries(cache[groupId])) {
      let scale = Math.max(0.5, Math.min(Math.sqrt(Date.now() - (priorityData[id]?.lastAnswerTime ?? 0)) / 6000, 2))
      priorityData[id] = {
        wrongAnswerRate: ((priorityData[id]?.wrongAnswerRate ?? 0) + data.wrongAnswerRate * scale) / (scale + 1),
        memorizationRate: ((priorityData[id]?.memorizationRate ?? 0) + data.memorizationRate * scale) / (scale + 1),
        lastAnswerTime: Date.now()
      }
    }
    api.setPriorityData(workId, groupId, priorityData);
  }
}

export async function getPriorityScores(questions: QuestionWithId[]) {
  let scores: number[] = [];
  let priorityDataCache: {[groupId: string]: {[id: string]: PriorityData}} = {};
  for (let question of questions) {
    let priorityGroupData = priorityDataCache[question.groupId];
    if (priorityGroupData == null) {
      priorityGroupData = await api.getPriorityData(question.workId, question.groupId);
      priorityDataCache[question.groupId] = priorityGroupData;
    }
    let priorityData = priorityGroupData[question.id];

    let score = (1 - priorityData.memorizationRate) * 2 + priorityData.wrongAnswerRate;
    let forgettingRate = Math.sqrt(Math.max(0, Math.log(Date.now() - priorityData.lastAnswerTime) - 11.2)) / 4;
    score *= forgettingRate + 0.5;
    score *= Math.random() / 5 + 0.9;
    scores.push(score);
  }
  return scores;
}
