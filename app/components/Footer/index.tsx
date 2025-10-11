import Image from "next/image";
import Link from "next/link";

// MIDDLE LINKS DATA
interface ProductType {
  id: number;
  section: string;
  link: string[];
}

interface Social {
  imgsrc: string,
  href: string,
}

interface LinkItem {
  name: string;
  href: string;
}

const products: ProductType[] = [
  {
    id: 1,
    section: "Useful Links",
    link: ['Home', 'Market', 'Exchange', 'Dashboard', 'Profile', 'Tokenomics', 'FAQ'],
  }
]

const linkHrefs: { [key: string]: string } = {
  'Home': '/',
  'Market': '/market',
  'Exchange': '/exchange',
  'Dashboard': '/dashboard',
  'Profile': '/profile',
  'Tokenomics': '/#features-section',
  'FAQ': '/#faq-section',
}

const socialLinks: Social[] = [
  { imgsrc: '/images/Footer/twitter.svg', href: "https://twitter.com/" },
  { imgsrc: '/images/Footer/dribble.svg', href: "https://telegram.org/" },
  { imgsrc: '/images/Footer/insta.svg', href: "https://discord.com/" },
  { imgsrc: '/images/Footer/youtube.svg', href: "https://solana.com/" },
]


const footer = () => {
  return (
    <div className=" relative">
      <div className="radial-bg hidden lg:block"></div>
      <div className="mx-auto max-w-2xl mt-64 pb-16 px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        <div className="mt-24 grid grid-cols-1 gap-y-10 gap-x-16 sm:grid-cols-2 lg:grid-cols-12 xl:gap-x-8">

          {/* COLUMN-1 */}

          <div className='col-span-6'>
            <Image
              className="block h-12 w-20px mb-4"
              src={'/images/Logo/bitty-logo.svg'}
              alt="BITCOIN MASCOT logo"
              width={80}
              height={48}
            />
            <h3 className='text-lightblue text-sm font-normal leading-9 mb-4 lg:mb-16'> BITCOIN MASCOT is the Official Bitcoin Mascot Token on Solana, designed to reinvigorate the market and bring Bitcoin&rsquo;s spirit to everyone. Join the movement that&rsquo;s changing the game.</h3>
            <div className='flex gap-4'>
              {socialLinks.map((items, i) => (
                <Link href={items.href} key={i}>
                  <Image src={items.imgsrc} alt={`${items.imgsrc.split('/').pop()?.replace('.svg', '') ?? 'social'} icon`} className='footer-icons' width={24} height={24} />
                </Link>
              ))}
            </div>
          </div>

          {/* CLOUMN-2/3 */}

          {products.map((product) => (
            <div key={product.id} className="group relative col-span-2">
              <p className="text-white text-xl font-medium mb-9">{product.section}</p>
              <ul>
                {product.link.map((link: string, index: number) => (
                  <li key={index} className='mb-5'>
                    <Link href={linkHrefs[link] || '/'} className="text-offwhite  text-sm font-normal mb-6 space-links">{link}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="col-span-4">
            <h3 className="text-white text-xl font-medium mb-9">Contract Address</h3>
            <h4 className="text-offwhite text-sm font-normal mb-6 flex gap-2"><Image src={'/images/Footer/number.svg'} alt="contract-icon" width={20} height={20} style={{ width: 'auto', height: 'auto' }} />Tt0T0000T00000t000000000000tT</h4>
            <h4 className="text-offwhite text-sm font-normal mb-6 flex gap-2"><Image src={'/images/Footer/email.svg'} alt="solana-icon" width={20} height={20} style={{ width: 'auto', height: 'auto' }} />Solana Blockchain</h4>
            <h4 className="text-offwhite text-sm font-normal mb-6 flex gap-2"><Image src={'/images/Footer/address.svg'} alt="mascot-icon" width={20} height={20} style={{ width: 'auto', height: 'auto' }} />₿ Official Mascot</h4>
          </div>

        </div>
      </div>

      {/* All Rights Reserved */}

      <div className='py-8 px-4 border-t border-t-lightblue'>
        <h3 className='text-center text-offwhite'>© 2024 BITCOIN MASCOT. All rights reserved. Cryptocurrency investments carry risk.</h3>
      </div>

    </div>
  )
}

export default footer;
