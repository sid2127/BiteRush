import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import ItemCard from '../Components/ItemCard';
import { serverUrl } from '../App';

function AllShopItems() {

    const { shopId } = useParams();

    const [items, setItems] = useState([]);
    const [shop, setShop] = useState();

    console.log("Shop ID:", shopId);

    const GetShopItems = async () => {
        try {
            const result = await axios.get(`${serverUrl}/api/v1/item/getItemsByShop/${shopId}`,
                { withCredentials: true }
            )

            console.log(result);
            setItems(result.data.data.items);
            setShop(result.data.data.shop);
        } catch (error) {
            console.log("Error in getting items from shop", error);
        }

    }

    useEffect(() => {
        GetShopItems()
    }, [shopId])


    return (
        <>
            {shop &&
                <div className='w-full h-64 overflow-hidden mb-3.5'>
                    <img
                        src={shop.shopImage}
                        alt="shop"
                        className='w-full h-full object-cover'
                    />
                </div>
            }
            {items &&
                items.map((i , index) => (
                    <div className='w-full h-auto flex flex-wrap gap-5 justify-center mt-1.5'>
                        <ItemCard data={i} key={index}/>
                    </div>
                ))

            }
        </>
    )
}

export default AllShopItems