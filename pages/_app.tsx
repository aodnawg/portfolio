// import App from 'next/app'

import dynamic from "next/dynamic";
import Link from "next/link";
import "../style.css";

const ContentDynamic = dynamic(() => import("../components/Visual/Visual"), {
  ssr: false,
});

function MyApp({ Component, pageProps }) {
  return (
    <>
      <ContentDynamic />
      <div className="relative z-10 m-6">
        <div>
          <h2 className="h text-4xl mb-3">
            <Link href="/">
              <a>aodnawg</a>
            </Link>
          </h2>
        </div>
        <div className="md:flex">
          <div className="mr-6 w-1/4 mb-6">
            <ul className="text-">
              <li>
                <Link href="/me">
                  <a>me</a>
                </Link>
              </li>
              <li>
                <Link href="/works">
                  <a>works</a>
                </Link>
              </li>
              <li>
                <Link href="/social">
                  <a>social media</a>
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <Component {...pageProps} />
          </div>
        </div>
      </div>
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
