Start = Text
Text = (RawText / Command)*
Command = '/' name:$(CommandNameChar (CommandNameChar / [0-9])*) args:(_ '(' @($[^,)]+)|0.., ','| ')')? values:(_ '{' @Text '}')? {return {type: 'command', name, args: args ?? [], values: values ?? [], raw: text()}}
CommandNameChar = [a-z$]
RawText = text:(Escape / [^/{}] / $('/' !CommandNameChar) / $('{' RawText? '}'))+ {return {type: 'text', value: text.join('')}}
Escape = '/' @[/{}]
_ 'space' = [ \t\n\r]*
