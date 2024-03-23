import {
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import { TopBarInnerContext } from "~/contexts/TopBarInner";


export const TopBarHelmet = (props:{
  children: JSX.Element | null;
})=>{
  const [showChild, setShowChild] = useState(false);
  // Wait until after client-side hydration to show
  useEffect(() => {
    setShowChild(true);
  }, []);
  if (!showChild) {
    // You can show some kind of placeholder UI here
    return null;
  }

  return <LazyLoadTopBarInnerContent {...props} />;
}

const LazyLoadTopBarInnerContent = (props:{
  children: JSX.Element | null;
})=>{
  const { setTopBarInner } = useContext(TopBarInnerContext) || {};

  useLayoutEffect(()=>{
    if(setTopBarInner){
      setTopBarInner(props.children);
    }
  },[setTopBarInner]);

  return null;
}
