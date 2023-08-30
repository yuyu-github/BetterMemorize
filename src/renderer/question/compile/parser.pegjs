Start = Text
Text = (RawText / Command)*
Command = '/' name:$(CommandNameChar (CommandNameChar / [0-9])*) value:(_ '{' @Text '}')? {return {type: 'command', name, value: value ?? []}}
CommandNameChar = [a-z$]
RawText = text:(Escape / [^/{}] / $('/' !CommandNameChar) / $('{' RawText? '}'))+ {return {type: 'text', value: text.join('')}}
Escape = '/' @[/{}]
_ 'space' = [ \t\n\r]*
