"use client"
import Image from "next/image";
import { Disclosure } from '@headlessui/react';
import { ChevronUpIcon } from '@heroicons/react/20/solid';

interface faqdata {
    heading: string;
    subheading: string;
}

const faqdata: faqdata[] = [
    {
        heading: "1. What is BITCOIN MASCOT?",
        subheading: 'BITCOIN MASCOT is the Official Bitcoin Mascot Token, a revolutionary Solana token designed to reinvigorate the market and bring Bitcoin\'s spirit to everyone. It bridges Bitcoin\'s legacy with Solana\'s innovation.'
    },
    {
        heading: "2. Why choose BITCOIN MASCOT?",
        subheading: 'BITCOIN MASCOT is the original Bitcoin Mascot from Christmas 2014. We focus on building real utility like DEX, swap, and cultural movement, not scams or pumps. Our supply is fixed, taxes are zero, and liquidity is locked.'
    },
    {
        heading: "3. How can I buy BITCOIN MASCOT?",
        subheading: 'You can buy BITCOIN MASCOT on Solana DEXs using the contract address: BXuvB1AQVFbgAzYY77HWsG35PcGKZNPjhHEwZ4nAQ47D. Connect your Solana wallet and trade safely.'
    },

]

const Faq = () => {
    return (
        <div className="my-20 px-6" id="faq-section">
            <h3 className="text-center text-3xl lg:text-5xl font-bold text-offwhite mb-3">Frequently Asked Questions</h3>
            <p className="text-center lg:text-lg font-normal text-bluish">Learn more about BITCOIN MASCOT, the official Bitcoin Mascot Token on Solana. <br /> Get answers to common questions.</p>

            <div className="mx-auto max-w-7xl">
                <div className="grid lg:grid-cols-2">
                    {/* Column-1 */}
                    <div>
                        <div className="w-full px-4 pt-16">

                            {faqdata.map((items, i) => (
                                <div className="mx-auto w-full max-w-5xl rounded-2xl bg-blue py-8 px-6 mb-5" key={i}>
                                    <Disclosure>
                                        {({ open }) => (
                                            <>
                                                <Disclosure.Button className="flex w-full justify-between rounded-lg text-offwhite sm:px-4 sm:py-2 text-left md:text-2xl font-medium">
                                                    <span>{items.heading}</span>
                                                    <ChevronUpIcon
                                                        className={`${open ? 'rotate-180 transform' : ''
                                                            } h-5 w-5 text-purple-500`}
                                                    />
                                                </Disclosure.Button>
                                                <Disclosure.Panel className="px-4 pt-4 pb-2 md:text-lg text-bluish font-normal opacity-50">{items.subheading}</Disclosure.Panel>
                                            </>
                                        )}
                                    </Disclosure>
                                </div>
                            ))}

                        </div>
                    </div>

                    {/* Column-2 */}
                    <div className="mt-32">
                        <Image src={'/images/Faq/faq.svg'} alt="faq-image" width={941} height={379} />
                    </div>

                </div>
            </div>

        </div>
    )
}

export default Faq;
