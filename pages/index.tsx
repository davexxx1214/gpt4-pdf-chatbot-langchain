import Layout from '@/components/layout';
import Link from 'next/link'

export default function Home() {
  return (

    <>
      <Layout>

        <img
          src="/backgroud1.png" alt="AILogo"
        />
        <div className="absolute w-400 h-full top-0 bottom-0 left-10 right-0 flex items-center justify-left">
          <div className="flex flex-col items-left">
            <span className="text-white text-3xl break-words">Leverage our management experience</span>
            <span className="text-white text-3xl break-words">Enhance your investing experience</span>
          </div>
        </div>
        <div className="absolute w-full h-full top-40 bottom-0 left-10 right-0 flex items-center justify-left">
          <Link className="text-xl px-4 py-2 rounded text-blue-600 bg-white" href="/chat">Talk with AI</Link>
        </div>
      </Layout>
    </>
  );
}
