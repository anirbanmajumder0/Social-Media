// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { quickClient } from "../../sanity";
import { Tweet } from '../../typings';
import { groq } from "next-sanity";

const feedQuery = groq`
*[_type=="tweet" && !blockTweet]{
    _id,
    _createdAt,
    _type,
    likes,
    text,
    image,
    "username":user->name,
    "userimg":user->image
  } | order(_createdAt desc)
`


type Data = {
    tweets: Tweet[]
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    const tweets: Tweet[] = await quickClient.fetch(feedQuery)
    res.setHeader('Cache-Control', 'no-store')
    res.status(200).json({ tweets })
}
