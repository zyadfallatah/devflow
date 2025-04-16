import qs from "query-string";

interface UrlQueryParams {
  params: string;
  key: string;
  value: string;
}

interface ReomveUrlQueryParams {
  params: string;
  keysToRemove: string[];
}

export const formUrlQuery = ({ params, key, value }: UrlQueryParams) => {
  const currentUrl = qs.parse(params);
  currentUrl[key] = value;

  return qs.stringifyUrl({ url: window.location.pathname, query: currentUrl });
};

export const removeKeyFromUrlQuery = ({
  params,
  keysToRemove,
}: ReomveUrlQueryParams) => {
  const queryString = qs.parse(params);

  keysToRemove.forEach((key) => {
    delete queryString[key];
  });

  return qs.stringifyUrl(
    { url: window.location.pathname, query: queryString },
    { skipNull: true }
  );
};
