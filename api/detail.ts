import fs from "fs";
import path from "path";
import matter from "gray-matter";
import marked from "marked";

interface MetaData {
  cotnent: string;
  date: number;
  title: string;
}

export const getDetail = (date: string) => {
  const textPath = path.join(process.cwd(), "text", `${date}.md`);
  const textRaw = fs.readFileSync(textPath).toString();
  const { data, content } = matter(textRaw);
  const parsedContent = marked(content);
  const { title, date: date_ } = data;

  return { content: parsedContent, title, date: date_ };
};
