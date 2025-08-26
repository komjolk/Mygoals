import seed from './seed';
export default async function Page() {
    const res = await seed();
  return res;
}