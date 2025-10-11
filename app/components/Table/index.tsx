"use client"
import Image from "next/image";
import { useState, useEffect } from "react";

interface table {
    index: number;
    name: string;
    price: number;
    change: number;
    cap: number;
    action: string;
    imgSrc: string;
}

const staticData: table[] = [
    {
        index: 2,
        name: "Solana(SOL)",
        imgSrc: '/images/Table/cryptoone.svg',
        price: 150.23,
        change: 5.2,
        cap: 50000000,
        action: "Buy",
    },
    {
        index: 3,
        name: "Bitcoin(BTC)",
        imgSrc: '/images/Table/cryptothree.svg',
        price: 60000.00,
        change: 2.1,
        cap: 1200000000,
        action: "Hold",
    },
    {
        index: 4,
        name: "Ethereum(ETH)",
        imgSrc: '/images/Table/cryptotwo.svg',
        price: 3000.00,
        change: -1.5,
        cap: 360000000,
        action: "Sell",
    },
]

const Table = () => {
    const [tableData, setTableData] = useState<table[]>(staticData);

    useEffect(() => {
        const fetchBittyData = async () => {
            try {
                const response = await fetch('https://api.dexscreener.com/latest/dex/tokens/Tt0T0000T00000t000000000000tT');
                const data = await response.json();
                if (data.pairs && data.pairs.length > 0) {
                    const pair = data.pairs[0];
                    const bitty: table = {
                        index: 1,
                        name: "BITCOIN MASCOT(BITTY)",
                        imgSrc: '/images/Table/bitty-icon.svg',
                        price: parseFloat(pair.priceUsd),
                        change: parseFloat(pair.priceChange.h24),
                        cap: parseFloat(pair.fdv),
                        action: pair.priceChange.h24 > 0 ? "Buy" : "Hold",
                    };
                    setTableData([bitty, ...staticData]);
                }
            } catch (error) {
                console.error('Failed to fetch BITCOIN MASCOT data:', error);
            }
        };
        fetchBittyData();
    }, []);

    return (
        <>
            <div className='mx-auto max-w-7xl pt-40 px-6' id="exchange-section">
                <div className="table-b bg-navyblue p-8 overflow-x-auto">
                    <h3 className="text-offwhite text-2xl">Market Overview</h3>
                    <table className="table-auto w-full mt-10">
                        <thead>
                            <tr className="text-white bg-darkblue rounded-lg">
                                <th className="px-4 py-4 font-normal">#</th>
                                <th className="px-4 py-4 text-start font-normal">NAME</th>
                                <th className="px-4 py-4 font-normal">PRICE</th>
                                <th className="px-4 py-4 font-normal">CHANGE 24H</th>
                                <th className="px-4 py-4 font-normal">MARKET CAP</th>
                                <th className="px-4 py-4 font-normal">ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tableData.map((items, i) => (
                                <tr key={i} className="border-b border-b-darkblue">
                                    <td className="px-4 py-6 text-center text-white">{items.index}</td>
                                    <td className="px-4 py-6 text-center text-white flex items-center justify-start gap-5 "><Image src={items.imgSrc} alt={items.imgSrc} height={50} width={50} />{items.name}</td>
                                    <td className="px-4 py-6 text-center text-white">${items.price.toLocaleString()}</td>
                                    <td className={`px-4 py-6 text-center ${items.change < 0 ? 'text-red' : 'text-green'} `}>{items.change}%</td>
                                    <td className="px-4 py-6 text-center text-white">${items.cap.toLocaleString()}</td>
                                    <td className={`px-4 py-6 text-center ${items.action === 'Buy' ? 'text-green' : 'text-red'}`}>
                                        {items.action}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <Image src={'/images/Table/Untitled.svg'} alt="ellipse" width={2460} height={102} className="md:mb-40 md:-mt-6" />
        </>
    )
}

export default Table;
