import {useQueryClient, useMutation} from 'react-query'
import { supabase } from '../utils/supabase'
import useStore from '../store'
import {Notice, EditedNotice} from '../types/types'

export const useMutateNotice = () => {
  const queryClient = useQueryClient()
  const reset = useStore((state => state.resetEditedNotice))
  
  const createNoticeMutation = useMutation(
    async (notice: Omit<Notice, 'id' | 'created_at'>) => {
      const {data, error} = await supabase
        .from('notices')
        .insert(notice)
        .select()       // satou
      if (error) throw new Error(error.message)
      return data
    },
    // 後処理
    {
      onSuccess: (res) => {
        const previousNotices = queryClient.getQueryData<Notice[]>(['notices'])
        if(previousNotices) {
          // 明示的に開発者がキャッシュ内容を更新
          queryClient.setQueryData(
            ['notices'], 
            [...previousNotices, res[0]]
          )
        }
        reset()
      },
      onError: (err: any) => {
        alert(err.message)
        reset()
      }
    }
  )
  const updateNoticeMutation = useMutation(
    async (notice: EditedNotice) => {
      const {data, error} = await supabase
        .from('notices')
        .update({content: notice.content})
        .eq('id', notice.id)
        .select()       // satou
      if (error) throw new Error(error.message)
      return data
    },
    {
      onSuccess: (res, variables) => {
        const previousNotices = queryClient.getQueryData<Notice[]>(['notices'])
        if(previousNotices) {
          queryClient.setQueryData(
            ['notices'], 
            previousNotices.map((notice) =>
            notice.id === variables.id? res[0]: notice
            )
          )
        }
        reset()
      },
      onError: (err: any) => {
        alert(err.message)
        reset()
      }
    }
  )
  const deleteNoticeMutation = useMutation(
    async (id: string) => {
      const {data, error} = await supabase.from('notices').delete().eq('id', id)
      if (error) throw new Error(error.message)
      return data
    },
    {
      onSuccess: (_, variables) => {
        // getQueryData: 既存のキャッシュを取ってくる
        const previosNotices = queryClient.getQueryData<Notice[]>(['notices'])
        if (previosNotices) {
          // setQueryData: キャッシュにセーブする
          queryClient.setQueryData(
            ['notices'],
            previosNotices.filter((notice) =>
            notice.id !== variables
            )
          )
        }
        reset()
      },
      onError: (err: any) => {
        alert(err.message)
        reset()
      }
    }
  )
  return {deleteNoticeMutation,updateNoticeMutation,createNoticeMutation}
}
