"use client"
import Image from 'next/image';

interface workdata {
    imgSrc: string;
    heading: string;
    subheading: string;
    hiddenpara: string;
}

const workdata: workdata[] = [
    {
        imgSrc: '/images/Work/icon-one.svg',
        heading: 'Build DEX',
        subheading: 'Developing a decentralized exchange for seamless trading on Solana.',
        hiddenpara: 'Our DEX will provide fast, secure, and user-friendly trading experiences.',
    },
    {
        imgSrc: '/images/Work/icon-two.svg',
        heading: 'Create Swap',
        subheading: 'Implementing a swap mechanism to facilitate easy token exchanges.',
        hiddenpara: 'The swap will integrate with Solana ecosystem for optimal performance.',
    },
    {
        imgSrc: '/images/Work/icon-three.svg',
        heading: 'Utility & Culture',
        subheading: 'Building real utility and a cultural movement rooted in Bitcoin history.',
        hiddenpara: 'Including education, entertainment, and community-driven initiatives.',
    },

]

const Work = () => {
    return (
        <div>
            <div className='mx-auto max-w-7xl mt-16 px-6 mb-20 relative'>
                <div className="radial-bgone hidden lg:block"></div>
                <div className='text-center mb-14'>
                    <h3 className='text-offwhite text-3xl md:text-5xl font-bold mb-3'>What We&rsquo;re Building</h3>
                    <p className='text-bluish md:text-lg font-normal leading-8'>BITTYMESSIAH is focused on real development, not just hype. <br /> Here&rsquo;s what we&rsquo;re creating to serve the community.</p>
                </div>

                <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-y-20 gap-x-5 mt-32'>

                    {workdata.map((items, i) => (
                        <div className='card-b p-8' key={i}>
                            <div className='work-img-bg rounded-full flex justify-center absolute p-6'>
                                <Image src={items.imgSrc} alt={items.imgSrc} width={44} height={44} />
                            </div>
                            <div>
                                <Image src={'/images/Work/bg-arrow.svg'} alt="arrow-bg" width={85} height={35} />
                            </div>
                            <h3 className='text-2xl text-offwhite font-semibold text-center mt-8'>{items.heading}</h3>
                            <p className='text-base font-normal text-bluish text-center mt-2'>{items.subheading}</p>
                            <span className="text-base font-normal m-0 text-bluish text-center hides">{items.hiddenpara}</span>
                        </div>
                    ))}

                </div>

            </div>
        </div>
    )
}

export default Work;
