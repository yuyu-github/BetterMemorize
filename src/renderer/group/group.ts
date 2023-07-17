import { listViewListDiv } from "../elements.js";

export async function updateGroups() {
  // works = await api.getWorks();
  // let newelem = createElement('div');
  // for (let id in works) {
  //   newelem.appendChild(createElement('div', {data: {id: id}}, [createElement('p', {}, [works[id].name])]));
  // }
  listViewListDiv.innerHTML = ''//newelem.innerHTML;
}
