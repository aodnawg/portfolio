import React from "react";
import Link from "next/link";
import { getList } from "../../api/list";

interface ListItem {
  title: string;
  date: number;
}

interface ListPageProps {
  list: ListItem[];
}

const Item: React.FC<ListItem> = ({ date, title }) => {
  return (
    <Link href={`/text/${date}`}>
      <a className="underline">
        {date} - {title}
      </a>
    </Link>
  );
};

const ListPage: React.FC<ListPageProps> = ({ list }) => {
  return (
    <section>
      <h1 className="h text-2xl">Text</h1>
      <ul>
        {list.map((props) => (
          <Item {...props} />
        ))}
      </ul>
    </section>
  );
};

export default ListPage;

export const getStaticProps = async () => {
  const list = getList();
  return {
    props: {
      list,
    },
  };
};
