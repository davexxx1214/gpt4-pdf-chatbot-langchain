import Layout from '@/components/layout';
import Link from 'next/link'

export default function Home() {
  return (

    <>
      <Layout>
        <img
          src="/backgroud.png" alt="AILogo"
        />
        <div className="absolute w-600 h-400 top-0 bottom-0 left-10 right-0 flex items-center justify-end">
          <div className="flex flex-col items-left">
            <span className="text-white text-3xl break-words">Leverage our management experience</span>
            <span className="text-white text-3xl break-words">Enhance your investing experience</span>
          </div>
        </div>
        <div className="absolute w-600 h-400 top-40 bottom-0 left-0 right-20 flex items-center justify-end">
        <div className="flex flex-row items-left gap-10">
          <Link className="text-xl px-4 py-2 rounded text-white bg-blue-500 hover:bg-gray-600" href="/chat">Talk with AI</Link>
          <Link className="text-xl px-4 py-2 rounded text-white bg-blue-500 hover:bg-gray-600" href="/azure">Manage your data</Link>
        </div>
        </div>
      </Layout>
    </>
  );
}
