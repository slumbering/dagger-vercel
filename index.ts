import { client, DaggerServer, gql, FSID, SecretID } from "@dagger.io/dagger";
import fetch from 'node-fetch';
import { execa } from "execa";
import { getSdk } from "./gen/core/core.js";

const core = getSdk(client);

import * as path from "path";

const resolvers = {
  Vercel: {
    deploy: async (args: {
      contents: FSID;
      build: string;
      subdir: string;
      siteName: string;
      token: SecretID;
      teamId: string | "";
    }) => {
      process.env["PATH"] =
      "/node_modules/.bin:" + process.env["PATH"];
      process.env["HOME"] = "/tmp";

      const token = await core
        .Secret({ id: args.token })
        .then((res) => res.core.secret);

      const vercelApiEndpoint = 'https://api.vercel.com/v9/projects'

        try {
          const findProjectByName = await fetch(`${vercelApiEndpoint}/${args.siteName}${args.teamId && `?teamId=${args.teamId}`}`, {
            headers: {
              "Authorization": `Bearer ${token}`
            },
            method: "get"
          })
  
          const response: any = await findProjectByName.json();
          
          // createNewProject
          if(response?.error?.code === "not_found") {
            await fetch(`${vercelApiEndpoint}${args.teamId && `?teamId=${args.teamId}`}`, {
              body: JSON.stringify({name: args.siteName}),
              headers: {'Content-Type': 'application/json', "Authorization": `Bearer ${args.token}`},
              method: "POST"
            })
          }
        } catch(error: any) {
          console.log(error)
        }

        try {
          const {stdout} = await execa(
            "vercel",
            ["-v" ],
            //["deploy", args.build, "--name", args.siteName, "--token", token, "--scope", args.teamId, "-y" ],
            {
              stderr: "inherit",
              cwd: path.join("/mnt/contents", args.subdir),
            }
          );
        
          return {
            deployURL: ` 🚀 ${stdout} 🚀`,
          };
        } catch(error) {
          console.log(error)
          return null
        } 
    },
  },
  Filesystem: {
    vercelDeploy: async (
      args: {
        subdir: string;
        siteName: string;
        token: SecretID;
        teamId?: string;
        build: string | '.';
      },
      parent: { id: FSID }
    ) => {
      return client
        .request(
          gql`
            {
              vercel {
                deploy(contents: "${parent.id}", subdir: "${args.subdir}", build: "${args.build}", siteName: "${args.siteName}", token: "${args.token}", teamId: "${args.teamId}") {
                  deployURL
                }
              }
            }
          `
        )
        .then((res: any) => res.vercel.deploy);
    },
  },
};

const server = new DaggerServer({ resolvers });

server.run();
