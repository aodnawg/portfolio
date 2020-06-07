import fs from "fs";
import path from "path";
import matter from "gray-matter";

interface MetaData {
  cotnent: string;
  date: number;
  title: string;
}

export const getList = () => {
  const textDirPath = path.join(process.cwd(), "text");
  const list = fs.readdirSync(textDirPath).filter((p) => p.match(/\.md/));

  const listData = list.map((l) => {
    const path_ = path.join(textDirPath, l);
    const textRaw = fs.readFileSync(path_).toString();
    const text = matter(textRaw);
    const { data } = text;
    const { title, date } = data as MetaData;
    return { title, date };
  });

  return listData;
};
