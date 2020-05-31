import React from "react";
import dynamic from "next/dynamic";

const ContentDynamic = dynamic(() => import("../components/Visual/Visual"), {
  ssr: false,
});

const HomePage = () => {
  return (
    <div>
      <ContentDynamic />
      aodnawg
    </div>
  );
};

export default HomePage;
