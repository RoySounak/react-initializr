import { BsFileZip } from 'react-icons/bs'
import { BiCopy } from 'react-icons/bi'
import { FiGithub } from 'react-icons/fi'

import { useRecoilValue } from "recoil";
import { 
  nameState, 
  versionState, 
  descriptionState, 
  gitRepoState, 
  authorState, 
  licenseState,
  languageState
} from "../atoms";

import Button from "./Button";
import ButtonLink from "./ButtonLink";

const Header = () => {

  const name = useRecoilValue(nameState);
  const version = useRecoilValue(versionState);
  const description = useRecoilValue(descriptionState);
  const gitRepo = useRecoilValue(gitRepoState);
  const author = useRecoilValue(authorState);
  const license = useRecoilValue(licenseState);
  const language = useRecoilValue(languageState);

  const copyLink = () => {
    const params = new URLSearchParams();

    if(name.trim() !== "") params.append("name", name);
    if(version.trim() !== "") params.append("version", version);
    if(description.trim() !== "") params.append("description", description);
    if(gitRepo.trim() !== "") params.append("repository", gitRepo);
    if(author.trim() !== "") params.append("author", author);
    if(license.trim() !== "") params.append("license", license);
    params.append("language", language);

    let domain = "http://localhost:3000";
    // let domain = "https://0l1v3rr.github.io/react-initializr";
    let url = `${domain}?${params.toString()}`

    // TODO: copy
    console.log(url);
  };

  return (
    <div className="flex items-center justify-center md:justify-between w-full h-fit border-b-2 border-solid 
      border-zinc-700 sm:px-12 px-4 py-4 sticky top-0 bg-zinc-800 shadow-md">
      <div className="items-center text-2xl gap-2 cursor-pointer md:flex hidden">
        <img className="w-12 animate-spin-slow" src={`${process.env.PUBLIC_URL}/logo512.png`} alt="React Logo" />
        <div className="flex items-center gap-1 font-semibold">
          <span className="color-react">React</span>
          <span>Initializr</span>
        </div>
      </div>

      <div className="flex gap-3 items-center">
        <Button
          text="Generate ZIP"
          icon={BsFileZip}
          onClick={() => {}}
        />

        <Button
          text="Copy Link"
          icon={BiCopy}
          onClick={copyLink}
        />

        <div className="hidden sm:block">
          <ButtonLink
            text="Source"
            icon={FiGithub}
            to="https://github.com/0l1v3rr"
          />
        </div>
      </div>
    </div>
  );
}

export default Header;