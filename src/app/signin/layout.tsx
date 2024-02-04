import {auth} from "@/app/api/auth";

export default async function ({children}:{children:any}) {
  const session = await auth()
  console.log(session)
  return <div className={'min-h-screen flex flex-col'}>
    <div className={'w-full flex items-end'}>
      {session ?
        <img className={'h-16 w-16'} src={session.user.image}/>
        : <div>
          Not logged in
        </div>
      }
    </div>
    {children}
  </div>
}