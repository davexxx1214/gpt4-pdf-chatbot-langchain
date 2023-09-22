import Layout from '@/components/layout';
import Link from 'next/link'

export default function Home() {
  return (

    <>
      <Layout>
        <img
          src="/backgroud.png" alt="AILogo"
        />
        <div className="absolute w-400 h-200 top-0 bottom-20 left-0 right-10 flex items-center justify-end">
          <div className="flex flex-col items-center">
            <span className="text-white text-2xl break-words">View and choose powerful model portfolios to</span>
            <span className="text-white text-2xl break-words">meet the diverse needs of our clients and</span>
            <span className="text-white text-2xl break-words">company with AI power</span>
          </div>
        </div>
        <div className="absolute w-600 h-400 top-40 bottom-0 left-0 right-20 flex items-center justify-end">
        <div className="flex flex-row items-left gap-12">
          <Link className="text-xl px-4 py-2 rounded text-white bg-blue-500 hover:bg-gray-600" href="/chat">Talk with AI</Link>
          <Link className="text-xl px-4 py-2 rounded text-white bg-blue-500 hover:bg-gray-600" href="/azure">Manage your data</Link>
        </div>
        </div>
      </Layout>
    </>
  );
}
