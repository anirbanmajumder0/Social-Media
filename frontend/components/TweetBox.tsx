import React, { useRef, useState } from 'react'
import {
    EmojiHappyIcon,
    PhotographIcon,
    SearchCircleIcon
} from "@heroicons/react/outline"
import { useSession } from 'next-auth/react'
import { Tweet, TweetBody } from '../typings'
import { fetchTweets } from '../utils/fetchTweets'
import { fetchUserId } from '../utils/fetchUserId'
import toast from 'react-hot-toast'
import dynamic from 'next/dynamic'
const Picker = dynamic(() => import('emoji-picker-react'), { ssr: false })


interface Props {
    setTweets: React.Dispatch<React.SetStateAction<Tweet[]>>
}

function TweetBox({ setTweets }: Props) {
    const [input, setInput] = useState<string>('')
    const [image, setImage] = useState('')
    const { data: session } = useSession()
    const [loading, setLoading] = useState(true)
    const [placeholder, setPlaceholder] = useState<string>('What\'s happening?')
    const [imageUrlBoxIsOpen, setImageUrlBoxIsOpen] = useState<boolean>(false)
    const imageInputRef = useRef<HTMLInputElement>(null)
    const [emojiPickerIsOpen, setEmojiPickerIsOpen] = useState<boolean>(false)


    function waitFor(conditionFunction:any) {
        const poll = (resolve:any) => {
          if(conditionFunction()) resolve()
          else setTimeout((_:any) => poll(resolve), 400)
        } 
        return new Promise(poll)
    }
    
    const uploadFromClient = async (event:any) => {

        await  waitFor((_:any) =>event.target.files.length!==0)
        const selectedFile = event.target.files[0]
        if (selectedFile.type === 'image/png' || selectedFile.type === 'image/svg' 
            || selectedFile.type === 'image/jpeg' || selectedFile.type === 'image/gif' 
            || selectedFile.type === 'image/tiff' || selectedFile.type === 'image/webp'
            && selectedFile.size < 1024 * 1024 * 9) {
            const notii =toast.loading('Uploading...', )
            setPlaceholder('Give a Title...')
            
            const formData = new FormData()
            formData.append('file', selectedFile)
            formData.append('upload_preset', 'my-uploads')
            try {
            const data = await fetch('https://api.cloudinary.com/v1_1/asddadakasd/image/upload', {
            method: 'POST',
            body: formData
            }).then(r => r.json())
            setImage(data.secure_url)
            setLoading(false)
            toast.success('Uploaded!',{id:notii})
            } catch (error) {
                toast.error('Server Too Busy!',{id:notii})
            }
        } else {
            toast.error('Invalid File Type!')
        }
    }   

    const onEmojiClick = (event:any , emojiObject:any) => {
        setInput(input+emojiObject.emoji)
        setEmojiPickerIsOpen(false)
    }

    const addImageToTweet = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()
        console.log(imageInputRef)
        if(!imageInputRef.current?.value) return
        setImage(imageInputRef.current.value)
        setLoading(false)
        imageInputRef.current.value = ''
        setImageUrlBoxIsOpen(false)
        setPlaceholder('Give a Title...')
    }
    
    const postTweet = async () => {

        const noti =toast.loading('Posting...', )
        const user = await fetchUserId(session?.user?.email)
		
        const tweetBody: TweetBody = {
            text: input,
            username: user || "Unknown User",
            userimg: " ",
            image: image
        }

        const result = await fetch(`/api/addTweet`, {
            body: JSON.stringify(tweetBody),
            method: 'POST'
        })

        const json = await result.json()
        const newTweets = await fetchTweets()
        setTweets(newTweets)
        setPlaceholder('What\'s happening?')
        setImage('')
        toast.success('Tweet Posted', {icon: '🚀',id:noti})
        return json
    }

    const handleSubmit = (e : React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()
        postTweet()
        setInput('')
        setImage('')
        setImageUrlBoxIsOpen(false)
        setLoading(true)
    }

    return (
        <div className='flex space-x-2 p-5 flex-wrap'>
            <img className='h-14 w-14 object-cover rounded-full mt-4' src={session?.user?.image || "/profile.jpg"} alt="" />
            <div className='flex flex-1 pl-2'>
                <form className='flex flex-1 flex-col'>
                    <input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    type="text" placeholder={placeholder} className='outline-none h-24 w-full text-base placeholder:text-base p-2 bg-boxcolor rounded-lg mb-6 md:px-10 md:text-xl md:placeholder:text-xl' />
                    <div className='flex items-center'>
                        <div className='flex flex-1 space-x-2 text-twitter'>
                            {/* Icons */}
                            <label htmlFor="upload-button">
                                <PhotographIcon  className='h-5 w-5' />
                            </label>
                            {session &&
                            <input id="upload-button" type="file" style={{ display: 'none' }} onClick={uploadFromClient}/>
                            }
                            <SearchCircleIcon onClick={() => setImageUrlBoxIsOpen(!imageUrlBoxIsOpen)} className='h-5 w-5 cursor-pointer transition transform duration-500 ease-out hover:scale-110' />
                            <EmojiHappyIcon className='h-5 w-5' onClick={() => setEmojiPickerIsOpen(!emojiPickerIsOpen)}/>
                        </div>
                        <button 
                        onClick={handleSubmit}
                        disabled={!input || !session} className='bg-twitter px-5 py-2 font-bold text-white rounded-full disabled:opacity-40'>Post</button>
                    </div> 
                    {image && !loading &&
                        <img src={image} className='mt-10 h-40 w-full rounded-xl object-contain shadow-lg'/>
                    }
                </form>
            </div>
            {emojiPickerIsOpen && (
                <Picker onEmojiClick={onEmojiClick} groupVisibility={{flags: false,}} native={true} disableSearchBar={true} />    
            )}
            {imageUrlBoxIsOpen && (
                <form className='flex flex-1 flex-col'>
                    <input ref={imageInputRef} type="text" placeholder='Enter Image Url'
                    className='outline-none h-20 mt-4 text-base placeholder:text-base p-2 bg-boxcolor rounded-lg mb-6 md:px-10 md:text-xl md:placeholder:text-xl'/>
                    <div className='flex'>
                        <button onClick={addImageToTweet} type="submit" 
                        disabled={!session} className='bg-twitter ml-2 px-5 py-2 font-bold text-white rounded-full disabled:opacity-40'>Add Image</button>
                    </div>
                </form>
            )}
        </div>
    )
}

export default TweetBox