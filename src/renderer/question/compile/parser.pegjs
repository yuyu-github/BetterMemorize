Start = Text
Text = (RawText / Command)*
Command = '/' name:$(CommandNameChar (CommandNameChar / [0-9])*) label:(_ ':' _ @$[a-zA-Z0-9_\-]+)? args:(_ '(' @($[^,)]+)|0.., ','| ')')? values:(_ '{' @Text '}')?
{return {type: 'command', name, label: label ?? '', args: args ?? [], values: values ?? [], raw: text()}}
CommandNameChar = [a-z_$]
RawText = text:(Escape / [^/{}] / $('/' !CommandNameChar) / $('{' RawText? '}'))+ {return {type: 'text', value: text.join('')}}
Escape = '/' @[/{}]
_ 'space' = [ \t\n\r]*
