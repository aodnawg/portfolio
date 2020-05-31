import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html>
        <Head>
          <link
            href="https://unpkg.com/tailwindcss@^1.0/dist/tailwind.min.css"
            rel="stylesheet"
          ></link>
          <link
            href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,400;0,900;1,100&display=swap"
            rel="stylesheet"
          ></link>
          <meta property="og:url" content="https://aodnawg.space" />
          <meta property="og:title" content="aodnawg" />
          <meta property="og:image" content="https://aodnawg.space/ogp.jpg" />
          <meta property="og:description" content="aodnawg" />
          <meta name="twitter:card" content="summary" />
          <meta name="twitter:site" content="@aodnawg" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
