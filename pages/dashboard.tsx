import React from "react";
import Layout from '@/components/layout';

const Dashboard = () => {
  return (
    <>
      <Layout>
        <div className="center">
          <iframe src="http://20.189.79.55:3000/d/f417d4a7-4d6f-4aaa-afcd-56afc0e4ae99/ss-overall-models?orgId=1&from=1695180484703&to=1695202084703"  width="100%" height="800px"></iframe>
        </div>
      </Layout>
    </>
  );
};
export default Dashboard;
