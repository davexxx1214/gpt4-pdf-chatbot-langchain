import React from "react";
import Layout from '@/components/layout';

const Dashboard = () => {
  return (
    <>
      <Layout>
        <div className="center">
          <iframe src="http://20.24.158.53:3000/d/fViuhCiIk/modelsdashboard?orgId=1&kiosk=tv&var-Model=All&from=1695088764154&to=1695261564154&refresh=5s"  width="100%" height="800px"></iframe>
        </div>
      </Layout>
    </>
  );
};
export default Dashboard;
