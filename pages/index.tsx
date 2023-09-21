import Layout from '@/components/layout';
import Link from 'next/link'

export default function Home() {
  return (

    <>
      <Layout>
        <img
          src="/backgroud.png" alt="AILogo"
        />
        <div className="absolute w-full h-200 top-0 bottom-0 left-0 right-0 flex items-center justify-end gap-4">
          <div className="flex flex-col items-center">
            <span className="text-white text-3xl break-words">Leverage our management experience</span>
            <span className="text-white text-3xl break-words">Enhance your investing experience</span>
          </div>
        </div>
        <div className="absolute w-full h-300 top-21 bottom-0 left-0 right-0 flex items-center justify-center gap-10">
          <Link className="text-xl px-4 py-2 rounded text-blue-600 bg-white hover:bg-gray-600" href="/chat">Talk with AI</Link>
          <Link className="text-xl px-4 py-2 rounded text-blue-600 bg-white hover:bg-gray-600" href="/chat">Manage Your Data</Link>
        </div>
      </Layout>
    </>
  );
}
