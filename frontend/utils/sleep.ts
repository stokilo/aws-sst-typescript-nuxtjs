export default async function sleep(time: number): Promise<any> {
  return new Promise(r => setTimeout(r, time));
}
