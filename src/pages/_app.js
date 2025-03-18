import Head from "next/head";
import "@/styles/globals.css";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Prism - AI-Powered LED Controller</title>
        <meta name="description" content="Control your LED strip with AI voice commands" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
