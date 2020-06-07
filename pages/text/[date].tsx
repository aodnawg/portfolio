import React, { useEffect, useRef } from "react";
import { getDetail } from "../../api/detail";
import { getList } from "../../api/list";

interface ListPageProps {
  detail: any;
}

const domClassNameTapple = [
  ["h1", "font-black my-4"],
  ["h2", "font-black my-3"],
  ["h3", "font-black my-2"],
  ["p", "my-2"],
  ["ul", "list-disc my2 list-inside"],
  ["a", "underline text-gray-600"],
];

const ListPage: React.FC<ListPageProps> = ({
  detail: { title, date, content },
}) => {
  const d = useRef<HTMLElement>(null);
  useEffect(() => {
    if (d.current === null) return;

    domClassNameTapple.forEach(([domName, className]) => {
      d.current
        .querySelectorAll(domName)
        .forEach((dom) => (dom.className = className));
    });
  }, [d]);

  return (
    <section>
      <div className="mb-4">
        <h1 className="font-black mr-2 text-2xl">{title}</h1>
        <h2 className="font-black mb-2 text-gray-600">{date}</h2>
      </div>

      <section
        ref={d}
        className=" leading-normal"
        dangerouslySetInnerHTML={{ __html: content }}
      ></section>
    </section>
  );
};

export default ListPage;

// This function gets called at build time
export async function getStaticPaths() {
  const list = getList().map(({ date }) => date);
  const paths = list.map((date) => `/text/${date}`);
  return { paths, fallback: false };
}

export const getStaticProps = async ({ params }) => {
  console.log(params);
  const detail = getDetail(params.date);
  return {
    props: {
      detail,
    },
  };
};
