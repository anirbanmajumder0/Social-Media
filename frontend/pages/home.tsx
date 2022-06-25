import type { GetServerSideProps} from 'next'
import Head from 'next/head'
import { Toaster } from 'react-hot-toast'
import Feed from '../components/Feed'
import Sidebar from '../components/Sidebar'
import Widgets from '../components/Widgets'
import Header from '../components/Header'
import { Tweet } from '../typings'
import { fetchTweets } from '../utils/fetchTweets'

interface Props {
	tweets: Tweet[]
}

const Home = ({ tweets }: Props) => {
	return (
		<div className="lg:max-w-7xl mx-auto max-h-screen overflow-hidden">
			<Head>
				<title>SOcial</title>
        		<link rel="icon" href="/logo.png" />
			</Head>
			<Toaster/>
			<Header/>
			<main className='grid grid-cols-9'>
				<Sidebar/>
				<Feed tweets={tweets}/>
				<Widgets/>
			</main>
		</div>
	)
}

export default Home
export const getServerSideProps: GetServerSideProps = async (context) => {
	const tweets = await fetchTweets()
	return {
		props: {
			tweets,
		}
	}
}