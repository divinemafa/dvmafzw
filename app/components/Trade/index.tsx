import Image from "next/image";


const Trade = () => {
    return (
        <div className="mx-auto max-w-7xl mt-48 mb-16 px-6 relative">
            <div className="radial-bgone hidden lg:block"></div>

            <div className="grid lg:grid-cols-2 gap-x-5">
                {/* Column-1 */}
                <div>
                    <Image src={'/images/Trade/macbook.png'} alt="macBook-image" width={787} height={512} />
                </div>

                {/* Column-2 */}

                <div>
                    <h3 className="text-3xl lg:text-5xl font-semibold text-offwhite mb-6 text-center sm:text-start">Join the Revolution <br /> Connect with Us</h3>
                    <p className="lg:text-lg font-normal text-lightblue mb-16 text-center sm:text-start">Be part of the BITCOIN MASCOT community. Follow for updates, join discussions, and stay connected in our hub.</p>
                    <div className="flex justify-between">
                        <Image src={'/images/Trade/mac.svg'} alt="twitter-image" width={61} height={105} />
                        <div className="verticalLine"></div>
                        <Image src={'/images/Trade/appstore.svg'} alt="telegram-image" width={80} height={105} />
                        <div className="verticalLine"></div>
                        <Image src={'/images/Trade/windows.svg'} alt="discord-image" width={80} height={105} />
                        <div className="verticalLine"></div>
                        <Image src={'/images/Trade/android.svg'} alt="solana-image" width={71} height={105} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Trade;
