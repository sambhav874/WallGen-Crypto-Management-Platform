import React from 'react';
import { Input } from '@/components/ui/input'; // Replace with your actual ShadCN Input component path
import { Button } from '@/components/ui/button'; // Replace with your actual ShadCN Button component path
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faInstagram, faLinkedin } from '@fortawesome/free-brands-svg-icons';

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-white py-12">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start">
          <div className="mb-8 md:mb-0">
            <div className="flex items-center mb-4">
              <div className="bg-white p-2 rounded-full">
                {/* Insert your logo or SVG icon here */}
                <img src="/path-to-your-logo.svg" alt="Logo" className="w-8 h-8" />
              </div>
            </div>
            <p className="text-gray-400">© 2024 YourCompany. All rights reserved.</p>
          </div>

          <div className="flex flex-col md:flex-row space-y-8 md:space-y-0 md:space-x-12">
            <div>
              <h5 className="font-semibold text-lg mb-4">ABOUT</h5>
              <ul className="space-y-2">
                <li>
                  <Link href="/page">Home</Link>
                </li>
                <li>
                  <Link href="/contact">Get in touch</Link>
                </li>
                <li>
                  <Link href="/req-airdrop">Request Airdrop</Link>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold text-lg mb-4">PRODUCT</h5>
              <ul className="space-y-2">
                <li>
                  <Link href="/create-token">Create Token</Link>
                </li>
                <li>
                  <Link href="/generate-wallets">Generate Wallets</Link>
                </li>
                <li>
                  <Link href="/token-metadata">Token Metadata</Link>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold text-lg mb-4">EXPLORE</h5>
              <ul className="space-y-2">
                <li>
                  <Link href="/explorer">Explorer</Link>
                </li>
                <li>
                  <Link href="/transactions-explorer">Transactions Explorer</Link>
                </li>
                <li>
                  <Link href="/donate">Donate</Link>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold text-lg mb-4">Note</h5>
              <p className="text-gray-400 mb-4">
                For the best experience, we recommend you to use Phantom wallet.
              </p>
              <div className="flex space-x-8 ">
                <a href="https://www.github.com/sambhav874" target="_blank" rel="noopener noreferrer" className="text-white hover:text-purple-600">
                  <FontAwesomeIcon icon={faGithub} className="w-8 h-8" />
                </a>
                <a href="https://www.instagram.com/smhbvv_" target="_blank" rel="noopener noreferrer" className="text-white hover:text-purple-600">
                  <FontAwesomeIcon icon={faInstagram} className="w-8 h-8" />
                </a>
                <a href="https://www.linkedin.com/in/sambhavjain19" target="_blank" rel="noopener noreferrer" className="text-white hover:text-purple-600">
                  <FontAwesomeIcon icon={faLinkedin} className="w-8 h-8" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;