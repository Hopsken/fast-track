import { useMemo } from "react"
import { HiNoSymbol } from "react-icons/hi2"
import useSWRInfinite from "swr/infinite"
import { type Full as Photo } from "unsplash-js/dist/methods/photos/types"

import { useStorage } from "@plasmohq/storage/hook"

import { EDITOR_COLLECTION_ID, unsplash } from "~lib/unsplash"
import { StorageKey } from "~storage"

const getKey = (pageIndex: number, previousPageData: { results: any[] }) => {
  if (previousPageData && !previousPageData.results.length) return null // 已经到最后一页
  return ["/recommends", pageIndex + 1] // SWR key
}

const useRecommendPhotos = () => {
  return useSWRInfinite(getKey, async ([, pageIndex]) => {
    const response = await unsplash.collections.getPhotos({
      collectionId: EDITOR_COLLECTION_ID,
      page: Number(pageIndex)
    })
    return response.response
  })
}

export function PopupThemePicker() {
  const {
    data = [],
    isLoading,
    isValidating,
    size,
    setSize
  } = useRecommendPhotos()
  const [_, setCustomBackground] = useStorage<{
    id: string
    url: string
    thumb_url: string
  }>(StorageKey.CustomBackground)

  const totalCount = data[0]?.total || Infinity
  const allPhotos = useMemo(
    () => data.reduce((acc, cur) => acc.concat(cur.results), [] as Photo[]),
    [data]
  )
  const hasMore = totalCount > allPhotos.length
  const isLoadingMore = isLoading || isValidating

  return (
    <div>
      <div className="columns-2 ">
        <ResetItem onClick={() => setCustomBackground(null)} />
        {allPhotos.map((photo) => (
          <PhotoItem
            key={photo.id}
            photo={photo}
            onClick={() => {
              console.info(photo)
              setCustomBackground({
                id: photo.id,
                url: photo.urls.regular,
                thumb_url: photo.urls.thumb
              })
            }}
          />
        ))}
      </div>
      {isLoadingMore && <div className="loading loading-spinner mx-auto" />}
      {hasMore && !isLoadingMore && (
        <button className="btn w-full mt-2" onClick={() => setSize(size + 1)}>
          More
        </button>
      )}
    </div>
  )
}

function ResetItem(props: { onClick: () => void }) {
  return (
    <div
      className="mt-2 cursor-pointer p-8 flex items-center justify-center border rounded space-x-1"
      onClick={props.onClick}>
      <HiNoSymbol size={24} />
      <div>None</div>
    </div>
  )
}

function PhotoItem({ photo, onClick }: { photo: Photo; onClick: () => void }) {
  return (
    <div className="mt-2 cursor-pointer group relative" onClick={onClick}>
      <img
        className="aspect-auto	rounded "
        src={photo.urls.thumb}
        alt={photo.alt_description}
      />
      <div className="absolute hidden group-hover:flex bottom-0 left-0 right-0 bg-black/40 hover:bg-black/10  items-center px-2 py-1 text-xs text-white">
        <a
          href={photo.links.html}
          target="_blank"
          rel="noreferrer"
          className="underline">
          {photo.user.name}
        </a>
      </div>
    </div>
  )
}
