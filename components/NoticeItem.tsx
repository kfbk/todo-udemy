import { VFC,useState,useEffect } from 'react'
import { supabase } from '../utils/supabase'
import { PencilAltIcon, TrashIcon } from '@heroicons/react/solid'
import useStore from '../store'
import { useMutateNotice } from '../hooks/useMutateNotice'
import { Notice } from '../types/types'

// 引数は、Noticeの型から'created_at'を除いたもの
export const NoticeItem:VFC<Omit<Notice,'created_at'>> = ({id, content, user_id}) => {
  const [userId, setUserId] = useState<string | undefined>('')
  const update = useStore((state) => state.updateEditedNotice)
  const {deleteNoticeMutation} = useMutateNotice()
  useEffect (() => {
    // setUserId(supabase.auth.user()?.id)   satou
    const setuser = async () => {           // satou
      const { data } = await supabase.auth.getUser();
      setUserId(data.user?.id)
    }
    setuser()
  }, [])
  // console.log("userId=", userId)
  // console.log("user_id=", user_id)
  return (
    <li className='my-3 text-lg font-extraboid'>
      <span>{content}</span>
      {userId === user_id && (
        <div className="float-right ml-20 flex">
          <PencilAltIcon
            className="mx-1 h-5 w-5 cursor-pointer text-blue-500"
            onClick={() => {
              update({
                id: id,
                content: content,
              })
            }}
          />
          <TrashIcon
            className="h-5 w-5 cursor-pointer text-blue-500"
            onClick={() => {
              deleteNoticeMutation.mutate(id)
            }}
          />
        </div>
      )}
    </li>
  )
}

