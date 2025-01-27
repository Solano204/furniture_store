'use client';
import { Input } from '../ui/input';
import { useSearchParams, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce'; 
import { useState, useEffect } from 'react';

function NavSearch() {
  // i get the params
  const searchParams = useSearchParams();
  const { replace } = useRouter(); 
  const [search, setSearch] = useState(
    searchParams.get('search')?.toString() || ''
  );
  

  // This function will execute after of time specified to avoid execute in vain  in this case (3000)
  const handleSearch = useDebouncedCallback((value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      // here i define the params in the url
      params.set('search', value);
    } else {
      params.delete('search');
    }
    replace(`/products?${params.toString()}`); // Thiss modify current url,but all components that depends of this page /currentUrl will be re-render (for example in this current productContainer) (PAGE.JS) and i send the user to the new url specifed 
  }, 300);


  useEffect(() => {
    if (!searchParams.get('search')) {
      setSearch('');
    }
  }, [searchParams.get('search')]);

  return (
    <Input
      type='search'
      placeholder='search product...'
      className='max-w-xs dark:bg-muted '
      onChange={(e) => {
        setSearch(e.target.value);
        handleSearch(e.target.value);
      }}
      value={search}
    />
  );
}
export default NavSearch;