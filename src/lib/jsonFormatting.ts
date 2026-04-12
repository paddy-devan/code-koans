export function formatJsonText(input: string) {
  return JSON.stringify(JSON.parse(input), null, 2);
}
