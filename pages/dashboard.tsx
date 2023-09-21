import React from "react";
import Layout from '@/components/layout';

const Dashboard = () => {
  return (
    <>
      <Layout>
        <div className="center">
          <iframe src="http://20.24.158.53:3000/d/fViuhCiIk/modelsdashboard?orgId=1&refresh=5s&from=1695241247699&to=1695262847700"  width="100%" height="800px"></iframe>
        </div>
      </Layout>
    </>
  );
};
export default Dashboard;
