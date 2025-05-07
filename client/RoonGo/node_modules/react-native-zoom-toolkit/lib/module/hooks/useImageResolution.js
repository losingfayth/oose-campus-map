import { useEffect, useState } from 'react';
import { Image } from 'react-native';
/**
 * @description Gets the resolution of a bundle or network image.
 * @param source Object containing an url pointing to a network image and optional headers or a
 * require statement pointing to a bundle image asset.
 * @returns An object containing the following values:
 * - A boolean flag indicating whether the hook is fetching or not.
 * - Resolution of the image.
 * - An Error in case the image resolution fetching has failed.
 * @see https://glazzes.github.io/react-native-zoom-toolkit/utilities/useimageresolution.html
 */
export default function (source) {
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState(undefined);
  const [resolution, setResolution] = useState(undefined);
  const onSuccess = (width, height) => {
    setResolution({
      width,
      height
    });
    setIsFetching(false);
  };
  const onFailure = e => {
    setError(e);
    setIsFetching(false);
  };
  const deps = JSON.stringify(source);
  useEffect(() => {
    setIsFetching(true);
    if (typeof source === 'number') {
      const {
        width,
        height
      } = Image.resolveAssetSource(source);
      onSuccess(width, height);
      return;
    }
    if (source.headers === undefined) {
      Image.getSize(source.uri, onSuccess, onFailure);
      return;
    }
    Image.getSizeWithHeaders(source.uri, source.headers, onSuccess, onFailure);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deps]);
  return {
    isFetching,
    resolution,
    error
  };
}
//# sourceMappingURL=useImageResolution.js.map