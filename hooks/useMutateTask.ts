import {useQueryClient, useMutation} from 'react-query'
import { supabase } from '../utils/supabase'
import useStore from '../store'
import {Task, EditedTask} from '../types/types'

export const useMutateTask = () => {
  const queryClient = useQueryClient()
  const reset = useStore((state => state.resetEditedTask))
  
  const createTaskMutation = useMutation(
    async (task: Omit<Task, 'id' | 'created_at'>) => {
      // console.log('task-satou', task)
      const {data, error} = await supabase
        .from('todos')
        .insert(task)
        .select()       // satou
      if (error) throw new Error(error.message)
      return data
    },
    // 後処理
    {
      onSuccess: (res) => {
        const previousTodos = queryClient.getQueryData<Task[]>(['todos'])
        if(previousTodos) {
          // 明示的に開発者がキャッシュ内容を更新
          queryClient.setQueryData(
            ['todos'], 
            [...previousTodos, res[0]]
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
  const updateTaskMutation = useMutation(
    async (task: EditedTask) => {
      const {data, error} = await supabase
        .from('todos')
        .update({title: task.title})
        .eq('id', task.id)
        .select()       // satou
      if (error) throw new Error(error.message)
      return data
    },
    {
      onSuccess: (res, variables) => {
        const previousTodos = queryClient.getQueryData<Task[]>(['todos'])
        if(previousTodos) {
          queryClient.setQueryData(
            ['todos'], 
            previousTodos.map((task) =>
              task.id === variables.id? res[0]: task
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
  const deleteTaskMutation = useMutation(
    async (id: string) => {
      const {data, error} = await supabase.from('todos').delete().eq('id', id)
      if (error) throw new Error(error.message)
      return data
    },
    {
      onSuccess: (_, variables) => {
        // getQueryData: 既存のキャッシュを取ってくる
        const previosTodos = queryClient.getQueryData<Task[]>(['todos'])
        if (previosTodos) {
          // setQueryData: キャッシュにセーブする
          queryClient.setQueryData(
            ['todos'],
            previosTodos.filter((task) =>
              task.id !== variables
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
  return {deleteTaskMutation,updateTaskMutation,createTaskMutation}
}
