import { LoadingDotsBricks } from "~/components";

export const LoadingScreen = ()=>{
  return(
    <div
      id='loading-screen'
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
        <LoadingDotsBricks />
    </div>
  );
};