import React from "react";
import Header from "../Component/Header";
import SpecialityMenu from "../Component/SpecialityMenu";
import TopDoctor from "../Component/TopDoctor";
import Banner from "../Component/Banner";

function Home() {
  return (
    <div>
      <Header />
      <SpecialityMenu />
      <TopDoctor />
      <Banner />
    </div>
  );
}

export default Home;
