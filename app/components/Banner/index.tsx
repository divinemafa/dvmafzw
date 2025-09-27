"use client"
import Image from 'next/image';
import React, { useState } from 'react';


const Banner = () => {
    const [isOpen, setOpen] = useState(false)

    return (
        <div className='bg-image relative' id="home-section">
            <div className='arrowOne'></div>
            <div className='radial-banner hidden lg:block'></div>
        <div className="mx-auto max-w-7xl pt-16 lg:pt-40 sm:pb-24 px-6">

                <div className='height-work'>
                    <div className='grid grid-cols-1 lg:grid-cols-12 my-16'>
                        <div className='arrowTwo'></div>
                        <div className='col-span-7'>
                            <h1 className="text-4xl lg:text-7xl font-bold mb-5 text-white md:4px md:text-start text-center">
                                BITTYMESSIAH <br /> The Official Bitcoin Mascot Token
                            </h1>
                            <p className='text-white md:text-lg font-normal mb-10 md:text-start text-center'>A revolutionary Solana token designed to reinvigorate the market and bring Bitcoin&rsquo;s spirit to everyone. Join the movement that&rsquo;s changing the game.</p>
                            <div className='flex align-middle justify-center md:justify-start'>
                                <button className='text-xl font-semibold text-white py-4 px-6 lg:px-12 navbutton mr-6'>Buy BITTYMESSIAH</button>
                                <button onClick={() => window.open('https://dexscreener.com/solana/BXuvB1AQVFbgAzYY77HWsG35PcGKZNPjhHEwZ4nAQ47D', '_blank')} className='bg-transparent flex justify-center items-center text-white'><Image src={'/images/Banner/playbutton.svg'} alt="button-image" className='mr-3' width={47} height={47} />View Chart</button>
                            </div>
                        </div>

                        <div className='col-span-5 lg:-m-48'>
                            <div className='arrowThree'></div>
                            <div className='arrowFour'></div>
                            <div className='arrowFive'></div>
                            {isOpen && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75" onClick={() => setOpen(false)}>
                                    <div className="relative w-full max-w-4xl h-96" onClick={(e) => e.stopPropagation()}>
                                        <iframe
                                            src="https://dexscreener.com/solana/BXuvB1AQVFbgAzYY77HWsG35PcGKZNPjhHEwZ4nAQ47D?embed=1&theme=dark"
                                            width="100%"
                                            height="100%"
                                            frameBorder="0"
                                            allowFullScreen
                                        ></iframe>
                                        <button onClick={() => setOpen(false)} className="absolute top-2 right-2 text-white text-2xl">&times;</button>
                                    </div>
                                </div>
                            )}
                            <Image src="/images/Banner/bitty-banner.png" alt="nothing" width={1013} height={760} />
                            <div className='arrowSix'></div>
                            <div className='arrowSeven'></div>
                            <div className='arrowEight'></div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}

export default Banner;
