import React from 'react'
import Nav from './Navbar'
import { categories } from '../Category'
import CategoryCard from './CategoryCard'
import { useSelector } from 'react-redux'
import ItemCard from './ItemCard'
import { useNavigate } from 'react-router-dom'
import useGetItemsByCity from '../hooks/useGetItemsByCity'
import useGetShopsByCity from '../hooks/useGetShopsByCity'

function UserDashboard() {

  const currentCity = useSelector(state => state.user.currentCity);
  const shopInMyCity = useSelector(state => state.user.shopsInCity);
  const ItemsInMyCity = useSelector(state => state.user.itemsInCity);

  const navigate = useNavigate();

  useGetItemsByCity();
  useGetShopsByCity();


  return (
    <div className='w-screen min-h-screen flex flex-col gap-5 items-center bg-[#fff9f6] overflow-y-auto'>
      <Nav />

      {/* <h1 className='text-gray-800 text-2xl sm:text-3xl mt-28 text-center'>Inspiration for your first order</h1>
      <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-2.5">

        <div className='w-full relative'>

          <div className='w-full flex overflow-x-auto gap-4 pb-2 '>
            {categories.map((cate, index) => (
              <CategoryCard name={cate.category} image={cate.image} key={index} />
            ))}
          </div>
        </div>
      </div> */}

      <div className='w-full max-w-6xl flex flex-col gap-5 items-start p-2.5'>
        <h1 className='text-gray-800 text-2xl sm:text-3xl mt-24'>
          Best Shop in {currentCity ? currentCity : "Loading..."}
        </h1>
        <div className='w-full relative'>
          <div className='w-full flex overflow-x-auto gap-4 pb-2 '>
            {shopInMyCity?.map((shop, index) => (
              <CategoryCard name={shop.name} image={shop.shopImage} key={index} onClick={() => navigate(`/all-items/${shop._id}`)} />
            ))}
          </div>
        </div>
      </div>

      <div className='w-full max-w-6xl flex flex-col gap-5 items-start p-2.5'>
        <h1 className='text-gray-800 text-2xl sm:text-3xl'>
          Suggested Food Items
        </h1>

        <div className='w-full h-auto flex flex-wrap gap-5 justify-center'>
          {ItemsInMyCity?.map((item, index) => (
            <ItemCard key={index} data={item} />
          ))}
        </div>


      </div>

    </div>

  )
}

export default UserDashboard