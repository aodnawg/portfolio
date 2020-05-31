import React from "react";

const Section: React.FC<{ h: string; c: string }> = ({ h, c }) => {
  return (
    <section className="mb-3">
      <h3 className="h">
        <span className="bg-white bg-opacity-75">{h}</span>
      </h3>
      <p>
        <span className="bg-white bg-opacity-75">{c} </span>
      </p>
    </section>
  );
};

const data = [
  {
    h: "name",
    c: "aodnawg",
  },
  { h: "job", c: "software engineer" },
  { h: "interest", c: "web, frontend, user interface, conputer graphics" },
  { h: "like", c: "Typescript, GLSL" },
];

const Me = () => {
  return (
    <>
      {data.map((d) => {
        return <Section {...d} />;
      })}
    </>
  );
};

export default Me;
