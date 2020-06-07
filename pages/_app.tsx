// import App from 'next/app'

import dynamic from "next/dynamic";
import Link from "next/link";
import "../style.css";

const ContentDynamic = dynamic(() => import("../components/Visual/Visual"), {
  ssr: false,
});

interface NavItemProps {
  href: string;
  text: string;
}

const NavItem: React.FC<NavItemProps> = ({ href, text }) => {
  return (
    <li>
      <Link href={href}>
        <a className="font-black">{text}</a>
      </Link>
    </li>
  );
};

const navDate: NavItemProps[] = [
  { href: "/me", text: "me" },
  { href: "/works", text: "works" },
  { href: "/text", text: "text" },
  { href: "/social", text: "social media" },
];

function MyApp({ Component, pageProps }) {
  return (
    <>
      <ContentDynamic />
      <section className="relative z-10 m-6">
        <div>
          <h1 className="h text-4xl mb-3">
            <Link href="/">
              <a>aodnawg</a>
            </Link>
          </h1>
        </div>
        <div className="md:flex">
          <div className="mr-6 w-1/4 mb-6">
            <ul className="text-">
              {navDate.map((props) => (
                <NavItem {...props} />
              ))}
            </ul>
          </div>
          <div>
            <Component {...pageProps} />
          </div>
        </div>
      </section>
    </>
  );
}

// Only uncomment this method if you have blocking data requirements for
// every single page in your application. This disables the ability to
// perform automatic static optimization, causing every page in your app to
// be server-side rendered.
//
// MyApp.getInitialProps = async (appContext) => {
//   // calls page's `getInitialProps` and fills `appProps.pageProps`
//   const appProps = await App.getInitialProps(appContext);
//
//   return { ...appProps }
// }

export default MyApp;
