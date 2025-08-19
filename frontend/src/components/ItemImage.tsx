import React from 'react';

const itemImageUrl = (code: string) => `https://client.artifactsmmo.com/images/items/${code}.png`;

function handleItemImgError(e: React.SyntheticEvent<HTMLImageElement>) {
    const img = e.currentTarget;
    const original = img.alt || '';
    if (!img.dataset.lcTried && original) {
        img.dataset.lcTried = '1';
        img.src = itemImageUrl(original.toLowerCase());
    } else {
        img.style.display = 'none';
    }
}

function handleItemImgLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const img = e.currentTarget;
    if (img.style.display === 'none') img.style.display = '';
    if (img.dataset.lcTried) delete img.dataset.lcTried;
}

export default function ItemImage({code, className}: { code: string; className?: string }) {
    if (!code) return null;
    return (
        <img
            key={code}
            className={className || 'item-img'}
            src={itemImageUrl(code)}
            alt={code}
            loading="lazy"
            onLoad={handleItemImgLoad}
            onError={handleItemImgError}
        />
    );
}

export {itemImageUrl};
