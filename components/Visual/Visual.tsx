import { useEffect } from "react";
import { mount } from "../../visual";

const Visual = () => {
  useEffect(() => {
    mount();
  }, []);
  return null;
};

export default Visual;
