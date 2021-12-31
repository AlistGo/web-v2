import { useToast } from "@chakra-ui/react";
import React, {
  createContext,
  useState,
  useMemo,
  useEffect,
  useCallback,
} from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation } from "react-router-dom";
import useLocalStorage from "../../hooks/useLocalStorage";
import request from "../../utils/public";

export interface File {
  name: string;
  size: number;
  type: number;
  driver: string;
  updated_at: string;
  thumbnail: string;
  url: string;
  size_str?: string;
  time_str?: string;
}

export interface Resp<T> {
  code: number;
  message: string;
  data: T;
}

export interface PathResp {
  type: TypeType;
  driver: string;
  files: File[];
}

export interface FileProps {
  file: File;
  readme?: boolean;
}

interface Setting {
  key: string;
  value: string;
  // type: string;
}

var Settings: Setting[] = [];

export const getSetting = (key: string): string => {
  const setting = Settings.find((setting) => setting.key === key);
  return setting ? setting.value : "";
};

type TypeType = "file" | "folder" | "error" | "loading" | "unauthorized";

interface Sort {
  orderBy?: "name" | "updated_at" | "size";
  reverse: boolean;
}

export interface ContextProps {
  files: File[];
  setFiles: (files: File[]) => void;
  type: TypeType;
  setType: (type: TypeType) => void;
  show: string;
  setShow?: (show: string) => void;
  getSetting: (key: string) => string;
  showUnfold?: boolean;
  setShowUnfold?: (showFolder: boolean) => void;
  unfold?: boolean;
  setUnfold?: (fold: boolean) => void;
  lastFiles: File[];
  setLastFiles: (files: File[]) => void;
  password: string;
  setPassword?: (password: string) => void;
  settingLoaded: boolean;
  msg: string;
  setMsg: (msg: string) => void;
  sort: Sort;
  setSort: (sort: Sort) => void;
  multiSelect: boolean;
  setMultiSelect: (value: boolean | ((val: boolean) => boolean)) => void;
  selectFiles: File[];
  setSelectFiles: (files: File[]) => void;
}

export const IContext = createContext<ContextProps>({
  files: [],
  setFiles: () => {},
  type: "folder",
  show: "list",
  getSetting: getSetting,
  lastFiles: [],
  setLastFiles: () => {},
  password: "",
  settingLoaded: false,
  msg: "",
  setMsg: () => {},
  sort: { reverse: false },
  setSort: () => {},
  multiSelect: false,
  setMultiSelect: () => {},
  selectFiles: [],
  setSelectFiles: () => {},
  setType: () => {},
});

const IContextProvider = (props: any) => {
  const toast = useToast();
  const { t } = useTranslation();
  const [files, setFiles] = React.useState<File[]>([]);
  const [lastFiles, setLastFiles] = React.useState<File[]>([]);
  const [type, setType] = React.useState<TypeType>("loading");
  const [msg, setMsg] = useState("");
  const [settingLoaded, setSettingLoaded] = React.useState<boolean>(false);
  const [password, setPassword] = React.useState<string>(
    localStorage.getItem("password") || ""
  );
  const [sort, setSort] = useState<Sort>({
    orderBy: undefined,
    reverse: false,
  });
  const [multiSelect, setMultiSelect] = useLocalStorage("multiSelect", false);
  const [selectFiles, setSelectFiles] = useState<File[]>([]);

  const [show, setShow] = React.useState<string>(
    localStorage.getItem("show") || "list"
  );
  
  const initialSettings = useCallback(() => {
    request
      .get("settings")
      .then((resp) => {
        const res = resp.data;
        if (res.code === 200) {
          Settings = res.data;
          setSettingLoaded(true);
          document.title = getSetting("title") || "Alist";
          const version = getSetting("version") || "Unknown";
          console.log(
            `%c Alist %c ${version} %c https://github.com/Xhofe/alist`,
            "color: #fff; background: #5f5f5f",
            "color: #fff; background: #4bc729",
            ""
          );
          if (getSetting("favicon")) {
            const link = (document.querySelector("link[rel*='icon']") ||
              document.createElement("link")) as HTMLLinkElement;
            link.type = "image/x-icon";
            link.rel = "shortcut icon";
            link.href = getSetting("favicon");
            document.getElementsByTagName("head")[0].appendChild(link);
          }
        } else {
          toast({
            title: t(res.message),
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      })
      .catch((err) => {
        toast({
          title: t("Error"),
          description: err.message,
          status: "error",
          duration: null,
        });
      });
  }, []);
  useEffect(() => {
    initialSettings();
  }, []);


  const [showUnfold, setShowUnfold] = React.useState<boolean>(false);
  const [unfold, setUnfold] = React.useState<boolean>(false);
  return (
    <IContext.Provider
      value={{
        files,
        setFiles,
        type,
        setType,
        show,
        setShow,
        getSetting,
        showUnfold,
        setShowUnfold,
        unfold,
        setUnfold,
        lastFiles,
        setLastFiles,
        password,
        setPassword,
        settingLoaded,
        msg,
        setMsg,
        sort,
        setSort,
        multiSelect,
        setMultiSelect,
        selectFiles,
        setSelectFiles,
      }}
      {...props}
    />
  );
};

export default IContextProvider;