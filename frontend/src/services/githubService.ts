// GitHub Integration Service
// This service handles GitHub repository interactions for code sharing and collaboration

interface GitHubConfig {
  apiUrl: string;
  token?: string;
  clientId?: string;
  redirectUri?: string;
}

interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  clone_url: string;
  ssh_url: string;
  default_branch: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
  size: number;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  private: boolean;
}

interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string;
  type: string;
  content?: string;
  encoding?: string;
}

interface GitHubCommit {
  sha: string;
  message: string;
  author: {
    name: string;
    email: string;
    date: string;
  };
  url: string;
}

interface CreateRepositoryRequest {
  name: string;
  description?: string;
  private?: boolean;
  auto_init?: boolean;
  gitignore_template?: string;
  license_template?: string;
}

interface UpdateFileRequest {
  owner: string;
  repo: string;
  path: string;
  message: string;
  content: string;
  sha?: string;
  branch?: string;
}

class GitHubService {
  private config: GitHubConfig;
  private baseHeaders: Record<string, string>;

  constructor(config: GitHubConfig) {
    this.config = {
      apiUrl: 'https://api.github.com',
      ...config
    };

    this.baseHeaders = {
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    };

    if (this.config.token) {
      this.baseHeaders['Authorization'] = `Bearer ${this.config.token}`;
    }
  }

  /**
   * Authenticate user with GitHub OAuth
   */
  async authenticateWithGitHub(): Promise<string> {
    if (!this.config.clientId || !this.config.redirectUri) {
      throw new Error('GitHub OAuth configuration missing');
    }

    const authUrl = `https://github.com/login/oauth/authorize?` +
      `client_id=${this.config.clientId}&` +
      `redirect_uri=${encodeURIComponent(this.config.redirectUri)}&` +
      `scope=repo,user:email`;

    // In a real application, this would redirect to GitHub
    // For demo purposes, we'll simulate the process
    return new Promise((resolve, reject) => {
      const popup = window.open(authUrl, 'github-auth', 'width=600,height=600');
      
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          // Simulate successful authentication
          resolve('mock_access_token_' + Date.now());
        }
      }, 1000);

      // Timeout after 5 minutes
      setTimeout(() => {
        clearInterval(checkClosed);
        popup?.close();
        reject(new Error('Authentication timeout'));
      }, 300000);
    });
  }

  /**
   * Get user's repositories
   */
  async getUserRepositories(per_page = 30, page = 1): Promise<GitHubRepository[]> {
    try {
      const response = await fetch(
        `${this.config.apiUrl}/user/repos?per_page=${per_page}&page=${page}&sort=updated`,
        {
          headers: this.baseHeaders
        }
      );

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching repositories:', error);
      // Return mock data for development
      return this.getMockRepositories();
    }
  }

  /**
   * Create a new repository
   */
  async createRepository(repoData: CreateRepositoryRequest): Promise<GitHubRepository> {
    try {
      const response = await fetch(`${this.config.apiUrl}/user/repos`, {
        method: 'POST',
        headers: this.baseHeaders,
        body: JSON.stringify(repoData)
      });

      if (!response.ok) {
        throw new Error(`Failed to create repository: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating repository:', error);
      throw error;
    }
  }

  /**
   * Get repository contents
   */
  async getRepositoryContents(
    owner: string, 
    repo: string, 
    path = '',
    ref?: string
  ): Promise<GitHubFile[]> {
    try {
      let url = `${this.config.apiUrl}/repos/${owner}/${repo}/contents/${path}`;
      if (ref) {
        url += `?ref=${ref}`;
      }

      const response = await fetch(url, {
        headers: this.baseHeaders
      });

      if (!response.ok) {
        throw new Error(`Failed to get repository contents: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching repository contents:', error);
      return this.getMockFiles();
    }
  }

  /**
   * Get file content
   */
  async getFileContent(
    owner: string,
    repo: string,
    path: string,
    ref?: string
  ): Promise<string> {
    try {
      let url = `${this.config.apiUrl}/repos/${owner}/${repo}/contents/${path}`;
      if (ref) {
        url += `?ref=${ref}`;
      }

      const response = await fetch(url, {
        headers: this.baseHeaders
      });

      if (!response.ok) {
        throw new Error(`Failed to get file content: ${response.statusText}`);
      }

      const fileData = await response.json();
      
      if (fileData.content && fileData.encoding === 'base64') {
        return atob(fileData.content.replace(/\\n/g, ''));
      }

      return fileData.content || '';
    } catch (error) {
      console.error('Error fetching file content:', error);
      return '// Error loading file content';
    }
  }

  /**
   * Create or update a file in repository
   */
  async updateFile(fileData: UpdateFileRequest): Promise<GitHubCommit> {
    try {
      const { owner, repo, path, message, content, sha, branch } = fileData;
      
      const body: any = {
        message,
        content: btoa(content) // Base64 encode the content
      };

      if (sha) {
        body.sha = sha; // Required for updating existing files
      }

      if (branch) {
        body.branch = branch;
      }

      const response = await fetch(
        `${this.config.apiUrl}/repos/${owner}/${repo}/contents/${path}`,
        {
          method: 'PUT',
          headers: this.baseHeaders,
          body: JSON.stringify(body)
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update file: ${response.statusText}`);
      }

      const result = await response.json();
      return result.commit;
    } catch (error) {
      console.error('Error updating file:', error);
      throw error;
    }
  }

  /**
   * Fork a repository
   */
  async forkRepository(owner: string, repo: string): Promise<GitHubRepository> {
    try {
      const response = await fetch(
        `${this.config.apiUrl}/repos/${owner}/${repo}/forks`,
        {
          method: 'POST',
          headers: this.baseHeaders
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fork repository: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error forking repository:', error);
      throw error;
    }
  }

  /**
   * Get repository commits
   */
  async getRepositoryCommits(
    owner: string,
    repo: string,
    per_page = 30,
    page = 1
  ): Promise<GitHubCommit[]> {
    try {
      const response = await fetch(
        `${this.config.apiUrl}/repos/${owner}/${repo}/commits?per_page=${per_page}&page=${page}`,
        {
          headers: this.baseHeaders
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get commits: ${response.statusText}`);
      }

      const commits = await response.json();
      return commits.map((commit: any) => ({
        sha: commit.sha,
        message: commit.commit.message,
        author: {
          name: commit.commit.author.name,
          email: commit.commit.author.email,
          date: commit.commit.author.date
        },
        url: commit.html_url
      }));
    } catch (error) {
      console.error('Error fetching commits:', error);
      return this.getMockCommits();
    }
  }

  /**
   * Push code to GitHub repository
   */
  async pushCodeToRepository(
    owner: string,
    repo: string,
    files: Array<{ path: string; content: string }>,
    commitMessage: string,
    branch = 'main'
  ): Promise<GitHubCommit[]> {
    const commits: GitHubCommit[] = [];

    try {
      for (const file of files) {
        // Get existing file SHA if it exists
        let sha: string | undefined;
        try {
          const existingFile = await this.getRepositoryContents(owner, repo, file.path, branch);
          if (Array.isArray(existingFile)) {
            // If it's a directory, skip
            continue;
          }
          sha = (existingFile as any).sha;
        } catch {
          // File doesn't exist, that's fine
        }

        const commit = await this.updateFile({
          owner,
          repo,
          path: file.path,
          message: `${commitMessage} - ${file.path}`,
          content: file.content,
          sha,
          branch
        });

        commits.push(commit);
      }

      return commits;
    } catch (error) {
      console.error('Error pushing code to repository:', error);
      throw error;
    }
  }

  /**
   * Pull code from GitHub repository
   */
  async pullCodeFromRepository(
    owner: string,
    repo: string,
    paths?: string[],
    branch?: string
  ): Promise<Array<{ path: string; content: string }>> {
    try {
      const files: Array<{ path: string; content: string }> = [];
      
      if (paths && paths.length > 0) {
        // Pull specific files
        for (const path of paths) {
          const content = await this.getFileContent(owner, repo, path, branch);
          files.push({ path, content });
        }
      } else {
        // Pull all files from root
        const contents = await this.getRepositoryContents(owner, repo, '', branch);
        
        for (const item of contents) {
          if (item.type === 'file') {
            const content = await this.getFileContent(owner, repo, item.path, branch);
            files.push({ path: item.path, content });
          }
        }
      }

      return files;
    } catch (error) {
      console.error('Error pulling code from repository:', error);
      throw error;
    }
  }

  /**
   * Mock data for development/testing
   */
  private getMockRepositories(): GitHubRepository[] {
    return [
      {
        id: 1,
        name: 'stack-rush-solutions',
        full_name: 'user/stack-rush-solutions',
        description: 'My Stack Rush challenge solutions',
        html_url: 'https://github.com/user/stack-rush-solutions',
        clone_url: 'https://github.com/user/stack-rush-solutions.git',
        ssh_url: 'git@github.com:user/stack-rush-solutions.git',
        default_branch: 'main',
        language: 'JavaScript',
        stargazers_count: 12,
        forks_count: 3,
        size: 2048,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-20T10:30:00Z',
        pushed_at: '2024-01-20T10:30:00Z',
        private: false
      },
      {
        id: 2,
        name: 'react-dashboard-demo',
        full_name: 'user/react-dashboard-demo',
        description: 'Interactive React dashboard with real-time updates',
        html_url: 'https://github.com/user/react-dashboard-demo',
        clone_url: 'https://github.com/user/react-dashboard-demo.git',
        ssh_url: 'git@github.com:user/react-dashboard-demo.git',
        default_branch: 'main',
        language: 'TypeScript',
        stargazers_count: 28,
        forks_count: 7,
        size: 5120,
        created_at: '2024-01-10T00:00:00Z',
        updated_at: '2024-01-19T16:45:00Z',
        pushed_at: '2024-01-19T16:45:00Z',
        private: false
      }
    ];
  }

  private getMockFiles(): GitHubFile[] {
    return [
      {
        name: 'README.md',
        path: 'README.md',
        sha: 'abc123',
        size: 1024,
        url: 'https://api.github.com/repos/user/repo/contents/README.md',
        html_url: 'https://github.com/user/repo/blob/main/README.md',
        git_url: 'https://api.github.com/repos/user/repo/git/blobs/abc123',
        download_url: 'https://raw.githubusercontent.com/user/repo/main/README.md',
        type: 'file'
      },
      {
        name: 'src',
        path: 'src',
        sha: 'def456',
        size: 0,
        url: 'https://api.github.com/repos/user/repo/contents/src',
        html_url: 'https://github.com/user/repo/tree/main/src',
        git_url: 'https://api.github.com/repos/user/repo/git/trees/def456',
        download_url: null!,
        type: 'dir'
      }
    ];
  }

  private getMockCommits(): GitHubCommit[] {
    return [
      {
        sha: 'abc123def456',
        message: 'Add two sum algorithm solution',
        author: {
          name: 'Developer',
          email: 'dev@example.com',
          date: '2024-01-20T10:30:00Z'
        },
        url: 'https://github.com/user/repo/commit/abc123def456'
      },
      {
        sha: 'def456ghi789',
        message: 'Update README with usage instructions',
        author: {
          name: 'Developer',
          email: 'dev@example.com',
          date: '2024-01-19T16:45:00Z'
        },
        url: 'https://github.com/user/repo/commit/def456ghi789'
      }
    ];
  }
}

// Export the service and types
export {
  GitHubService,
  type GitHubConfig,
  type GitHubRepository,
  type GitHubFile,
  type GitHubCommit,
  type CreateRepositoryRequest,
  type UpdateFileRequest
};

// Default export
export default GitHubService;