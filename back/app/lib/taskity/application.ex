defmodule Taskity.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  def start(_type, _args) do
    children = [
      # Start the Ecto repository
      Taskity.Repo,
      # Start the Telemetry supervisor
      TaskityWeb.Telemetry,
      # Start the PubSub system
      {Phoenix.PubSub, name: Taskity.PubSub},
      # Start the Endpoint (http/https)
      TaskityWeb.Endpoint
      # Start a worker by calling: Taskity.Worker.start_link(arg)
      # {Taskity.Worker, arg}
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: Taskity.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  def config_change(changed, _new, removed) do
    TaskityWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
